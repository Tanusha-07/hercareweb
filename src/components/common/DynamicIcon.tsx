import {
  AppWindow,
  Ban,
  BatteryLow,
  Bone,
  BookOpen,
  Brain,
  CalendarDays,
  Droplet,
  Eye,
  Flower2,
  GlassWater,
  HandHeart,
  Heart,
  HeartCrack,
  HeartHandshake,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lock,
  Mic,
  Search,
  Settings,
  ShieldAlert,
  ShieldPlus,
  Siren,
  Sparkles,
  Speaker,
  Stethoscope,
  Sun,
  Thermometer,
  Users,
  Utensils,
  Wind,
  type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  AppWindow,
  Ban,
  BatteryLow,
  Bone,
  BookOpen,
  Brain,
  CalendarDays,
  Droplet,
  Eye,
  Flower2,
  GlassWater,
  HandHeart,
  Heart,
  HeartCrack,
  HeartHandshake,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lock,
  Mic,
  Search,
  Settings,
  ShieldAlert,
  ShieldPlus,
  Siren,
  Sparkles,
  Speaker,
  Stethoscope,
  Sun,
  Thermometer,
  Users,
  Utensils,
  Wind,
};

interface Props {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}

/** Resolve a data-driven icon name to a Lucide component, with a safe default. */
export default function DynamicIcon({ name, className, size = 28, strokeWidth = 2, ...rest }: Props) {
  const Icon = MAP[name] ?? Heart;
  return <Icon className={className} size={size} strokeWidth={strokeWidth} aria-hidden={rest['aria-hidden'] ?? true} />;
}
