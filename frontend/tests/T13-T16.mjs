import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoDir = path.resolve(frontendDir, '..')
const evidenceDir = path.join(repoDir, 'docs', 'testing', 'evidence')
const baseUrl = 'http://127.0.0.1:3010'

await mkdir(evidenceDir, { recursive: true })
const server = spawn(process.execPath, [
  path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
  'dev', '--hostname', '127.0.0.1', '--port', '3010',
], {
  cwd: frontendDir,
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverOutput = ''
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString() })
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString() })

let browser
const failures = []
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next.js exited before startup:\n${serverOutput}`)
    try {
      const response = await fetch(baseUrl)
      if (response.ok) { ready = true; break }
    } catch { /* server is still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  assert.ok(ready, `Next.js did not become ready:\n${serverOutput}`)

  browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', (error) => failures.push(error.message))

  // T13: sample lecturer and student reach their role-specific home screens.
  await page.goto(baseUrl)
  await page.locator('.role-grid .role-card').nth(1).click()
  await page.getByRole('heading', { name: /TS\. Nguyễn Văn A/ }).waitFor()
  await page.screenshot({ path: path.join(evidenceDir, 'T13-instructor.png'), fullPage: true })
  await page.reload()
  await page.locator('.role-grid .role-card').nth(0).click()
  await page.getByRole('heading', { name: /Nguyễn Văn B/ }).waitFor()
  await page.screenshot({ path: path.join(evidenceDir, 'T13-student.png'), fullPage: true })
  console.log('T13 PASS — instructor and student sample home screens render.')

  // T14: theme selection is persisted across a full page reload.
  const currentTheme = await page.locator('html').getAttribute('data-theme')
  const themeButtonName = currentTheme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'
  await page.getByRole('button', { name: themeButtonName }).click()
  const selectedTheme = currentTheme === 'dark' ? 'light' : 'dark'
  await page.waitForFunction((theme) => document.documentElement.getAttribute('data-theme') === theme, selectedTheme)
  assert.equal(await page.evaluate(() => localStorage.getItem('bklms-theme')), selectedTheme)
  await page.reload()
  await page.waitForFunction((theme) => document.documentElement.getAttribute('data-theme') === theme, selectedTheme)
  await page.screenshot({ path: path.join(evidenceDir, 'T14-theme-persisted.png'), fullPage: true })
  console.log(`T14 PASS — ${selectedTheme} theme remains selected after reload.`)
  await page.locator('.role-grid .role-card').nth(0).click()
  await page.getByRole('heading', { name: /Nguyễn Văn B/ }).waitFor()

  // T15: every course tab opens without a client-side exception.
  await page.locator('.sb-course').click()
  const tabs = page.getByRole('tablist', { name: 'Mục của lớp học' })
  const tabNames = ['Buổi học', 'Điểm danh', 'Thời khóa biểu', 'Thành viên', 'Thống kê', 'Bài kiểm tra', 'Bản đồ năng lực AI']
  for (const [index, name] of tabNames.entries()) {
    const tab = tabs.getByRole('tab', { name })
    await tab.click()
    assert.equal(await tab.getAttribute('aria-selected'), 'true', `Tab ${name} did not become active`)
    await page.locator('.course-hero').waitFor()
    await page.screenshot({ path: path.join(evidenceDir, `T15-tab-${index + 1}.png`), fullPage: true })
  }
  assert.deepEqual(failures, [], `Client-side errors while changing tabs: ${failures.join('; ')}`)
  console.log(`T15 PASS — all ${tabNames.length} course tabs render without client-side exceptions.`)

  // T16: open a session quiz, answer it, and reach the score screen.
  await tabs.getByRole('tab', { name: 'Bài kiểm tra' }).click()
  await page.getByRole('button', { name: 'Làm bài', exact: true }).first().click()
  const quiz = page.getByRole('dialog', { name: /Quiz Buổi/ })
  await quiz.waitFor()
  await quiz.getByRole('radio').filter({ hasText: '20' }).click()
  await quiz.getByRole('button', { name: 'Kiểm tra' }).click()
  while (!(await quiz.locator('.score').count())) {
    await quiz.getByRole('button', { name: /Xem kết quả|Câu tiếp theo/ }).click()
  }
  const score = await quiz.locator('.score').textContent()
  assert.match(score ?? '', /^\d+\/\d+$/)
  await page.screenshot({ path: path.join(evidenceDir, 'T16-quiz-score.png'), fullPage: true })
  console.log(`T16 PASS — quiz completed and score displayed (${score}).`)
} catch (error) {
  console.error(error)
  console.error(serverOutput)
  process.exitCode = 1
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
