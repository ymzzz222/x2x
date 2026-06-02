import type { RoomRole } from "@/lib/transfer-types";
import { roleItems, styles } from "../_config/config";

interface RoleSelectionProps {
  onSelect: (role: RoomRole) => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div className={styles.roleGrid}>
      {roleItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.role}
            type="button"
            onClick={() => onSelect(item.role)}
            className={[styles.roleCard.base, styles.roleCard.idle].join(" ")}
          >
            <div className={styles.roleIcon}>
              <Icon />
            </div>
            <h3 className={styles.roleTitle}>{item.title}</h3>
            <p className={styles.roleDescription}>{item.description}</p>
          </button>
        );
      })}
    </div>
  );
}
