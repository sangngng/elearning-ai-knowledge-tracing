import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoDir = path.resolve(frontendDir, '..')
const evidenceDir = path.join(repoDir, 'docs', 'testing', 'evidence')
// The UI talks to the real API: start the backend with the demo data first
// (scripts\\start-dev.bat, then scripts\\load-demo-data.bat). The backend allows
// http://localhost:3010 by default (CORS_ORIGIN).
const baseUrl = 'http://localhost:3010'
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

await mkdir(evidenceDir, { recursive: true })
const server = spawn(process.execPath, [
  path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
  'dev', '--hostname', 'localhost', '--port', '3010',
], {
  cwd: frontendDir,
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_API_URL: apiUrl },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverOutput = ''
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString() })
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString() })

let browser
const failures = []
async function logout(page) {
  await page.locator('.user-chip').click()
  await page.getByRole('button', { name: 'Đăng xuất' }).click()
  await page.getByRole('heading', { name: 'Đăng nhập' }).waitFor()
}

try {
  const health = await fetch(`${apiUrl}/health`).catch(() => null)
  assert.ok(health?.ok, `Backend is not reachable at ${apiUrl}. Start it and load the demo data first.`)
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

  browser = await chromium.launch(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH, headless: true }
    : { channel: 'msedge', headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', (error) => failures.push(error.message))

  // T13: demo lecturer and student log in through the API and reach their home screens.
  await page.goto(baseUrl)
  await page.locator('.role-grid .role-card').nth(1).click()
  await page.getByRole('heading', { name: /Nguyen Van A/ }).waitFor()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(evidenceDir, 'T13-instructor.png'), fullPage: true })
  await logout(page)
  await page.locator('.role-grid .role-card').nth(0).click()
  await page.getByRole('heading', { name: /Nguyen Van B/ }).waitFor()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(evidenceDir, 'T13-student.png'), fullPage: true })
  console.log('T13 PASS — instructor and student log in through the API and see their home screens.')

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
  await page.getByRole('heading', { name: /Nguyen Van B/ }).waitFor()
  console.log(`T14 PASS — ${selectedTheme} theme and the login remain after reload.`)

  // T15: every course tab of the lecturer opens without a client-side exception.
  await logout(page)
  await page.locator('.role-grid .role-card').nth(1).click()
  await page.getByRole('heading', { name: /Nguyen Van A/ }).waitFor()
  await page.locator('.sb-course').first().click()
  const tabs = page.getByRole('tablist', { name: 'Mục của lớp học' })
  const tabNames = ['Buổi học', 'Điểm danh', 'Thời khóa biểu', 'Thành viên', 'Thống kê', 'Bài kiểm tra', 'Bản đồ năng lực AI']
  for (const [index, name] of tabNames.entries()) {
    const tab = tabs.getByRole('tab', { name })
    await tab.click()
    assert.equal(await tab.getAttribute('aria-selected'), 'true', `Tab ${name} did not become active`)
    await page.locator('.course-hero').waitFor()
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: path.join(evidenceDir, `T15-tab-${index + 1}.png`), fullPage: true })
  }
  assert.deepEqual(failures, [], `Client-side errors while changing tabs: ${failures.join('; ')}`)
  console.log(`T15 PASS — all ${tabNames.length} course tabs render without client-side exceptions.`)

  // T16: a student takes a session quiz; every answer is graded by the server.
  await logout(page)
  await page.locator('.role-grid .role-card').nth(0).click()
  await page.getByRole('heading', { name: /Nguyen Van B/ }).waitFor()
  await page.locator('.sb-course').first().click()
  await tabs.getByRole('tab', { name: 'Bài kiểm tra' }).click()
  await page.getByRole('button', { name: 'Làm bài', exact: true }).first().click()
  const quiz = page.getByRole('dialog', { name: /Buổi/ })
  await quiz.waitFor()
  while (!(await quiz.locator('.score').count())) {
    await quiz.getByRole('radio').first().click()
    await quiz.getByRole('button', { name: 'Kiểm tra' }).click()
    await quiz.locator('.option.right, .option.wrong').first().waitFor()
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
