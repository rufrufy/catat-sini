import type { LucideProps } from "lucide-react";
import {
  BadgeDollarSign,
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Camera,
  Car,
  ChevronRight,
  Circle,
  Coffee,
  CreditCard,
  Gift,
  HandCoins,
  HeartPulse,
  House,
  ImageUp,
  LayoutDashboard,
  LineChart,
  Mic,
  PiggyBank,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  TrendingUp,
  Tv,
  User,
  Users,
  Wallet
} from "lucide-react";

const iconMap = {
  bell: Bell,
  "badge-dollar": BadgeDollarSign,
  brain: BrainCircuit,
  briefcase: BriefcaseBusiness,
  camera: Camera,
  car: Car,
  chevron: ChevronRight,
  circle: Circle,
  coffee: Coffee,
  "credit-card": CreditCard,
  dashboard: LayoutDashboard,
  gift: Gift,
  "hand-coins": HandCoins,
  heart: HeartPulse,
  chart: LineChart,
  house: House,
  image: ImageUp,
  mic: Mic,
  piggy: PiggyBank,
  plus: Plus,
  receipt: ReceiptText,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  "shopping-bag": ShoppingBag,
  smartphone: Smartphone,
  sparkles: Sparkles,
  trend: TrendingUp,
  tv: Tv,
  user: User,
  users: Users,
  wallet: Wallet
} as const;

export type AppIconName = keyof typeof iconMap;

export function AppIcon({
  name,
  className,
  strokeWidth = 2.2
}: LucideProps & {
  name: string;
}) {
  const Icon = iconMap[name as AppIconName] ?? Circle;
  return <Icon className={className} strokeWidth={strokeWidth} />;
}
