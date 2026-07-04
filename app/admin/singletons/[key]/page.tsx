import { SingletonEditClient } from "./SingletonEditClient";

const SINGLETON_KEYS = ["hero", "story", "navbar", "footer", "announcement", "giftSetsBanner"];

export function generateStaticParams() {
  return SINGLETON_KEYS.map((key) => ({ key }));
}

export default function SingletonEditPage() {
  return <SingletonEditClient />;
}
