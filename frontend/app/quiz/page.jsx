import { redirect } from 'next/navigation';

// Quiz hiện được làm trực tiếp trong buổi học (Course > Buổi học > Quiz tương tác).
export default function Quiz() {
  redirect('/');
}
