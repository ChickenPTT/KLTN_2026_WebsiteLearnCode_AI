/**
 * Danh sach chu de tinh tu bai tap that (backend). Chu de co trong TOPIC_INFOS giu icon/mo ta san co;
 * chu de la (vd. "basic" do giang vien tao template) duoc tao the mac dinh.
 * So bai / do kho luon dem tu du lieu that, khong dung so lieu mau trong TOPIC_INFOS.
 */
import { TOPIC_INFOS, type PracticeProblem, type TopicInfo } from '@/types';
import { sameTopic } from '@/lib/problemsApi';

function countDifficulties(problems: PracticeProblem[]): TopicInfo['difficulties'] {
  return {
    easy: problems.filter((p) => p.difficulty === 'Easy').length,
    medium: problems.filter((p) => p.difficulty === 'Medium').length,
    hard: problems.filter((p) => p.difficulty === 'Hard').length,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Chu de san co (theo thu tu TOPIC_INFOS) + chu de la xuat hien trong du lieu */
export function buildTopics(problems: PracticeProblem[]): TopicInfo[] {
  const known = TOPIC_INFOS.map((t) => {
    const list = problems.filter((p) => sameTopic(p.topic, t.name));
    return { ...t, problemCount: list.length, difficulties: countDifficulties(list) };
  });

  const extraNames: string[] = [];
  problems.forEach((p) => {
    const isKnown = TOPIC_INFOS.some((t) => sameTopic(t.name, p.topic));
    if (!isKnown && !extraNames.some((n) => sameTopic(n, p.topic))) extraNames.push(p.topic);
  });
  const extra = extraNames.map((name): TopicInfo => {
    const list = problems.filter((p) => sameTopic(p.topic, name));
    return {
      name: capitalize(name),
      icon: 'Code2',
      description: `Các bài tập thuộc chủ đề ${capitalize(name)}.`,
      problemCount: list.length,
      difficulties: countDifficulties(list),
    };
  });

  return [...known, ...extra];
}

/** Tim chu de theo ten tren URL (khong phan biet hoa thuong) */
export function findTopic(name: string | undefined, problems: PracticeProblem[]): TopicInfo | undefined {
  if (!name) return undefined;
  return buildTopics(problems).find((t) => sameTopic(t.name, name));
}
