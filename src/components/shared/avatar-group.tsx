import { cn } from "@/lib/utils";
import Image from "next/image";

const defaultAvatars = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/90.jpg",
];

export function AvatarGroup({
  avatars = defaultAvatars,
  count,
  className,
}: {
  avatars?: string[];
  count?: number;
  className?: string;
}) {
  const remaining = count ? count - avatars.length : 0;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {avatars.slice(0, 5).map((src, i) => (
          <div
            key={i}
            className="relative h-8 w-8 rounded-full border-2 border-white overflow-hidden"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <span className="ml-2 text-sm font-medium text-white/90">
          +{remaining.toLocaleString()} more
        </span>
      )}
    </div>
  );
}
