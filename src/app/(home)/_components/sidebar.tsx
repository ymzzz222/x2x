import Link from "next/link";
import { navItems, styles, type NavTab } from "../_config/config";
import { BackIcon, AboutIcon } from "../_config/icons";

interface SidebarProps {
  showBack: boolean;
  onBack: () => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Sidebar({ showBack, onBack, activeTab, onTabChange }: SidebarProps) {
  const renderNavItem = (item: (typeof navItems)[number], compact = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const isExternal = "external" in item;

    const className = [
      styles.navButton.base,
      isActive ? styles.navButton.active : styles.navButton.inactive,
    ].join(" ");

    const inner = (
      <>
        <span className={styles.navIcon}><Icon /></span>
        {!compact && isActive && <span className={styles.activeDot} />}
      </>
    );

    return (
      <div key={item.id} className={styles.navItem}>
        {"link" in item ? (
          <Link
            href={item.link}
            prefetch={false}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={className}
            aria-label={item.label}
          >
            {inner}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onTabChange(item.id)}
            className={className}
            aria-label={item.label}
            aria-pressed={isActive}
          >
            {inner}
          </button>
        )}
        <span className={styles.tooltip} aria-hidden="true">{item.label}</span>
      </div>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className={styles.mobileBar}>
        <div className="flex items-center min-[360px]:gap-2">
          {showBack && (
            <button type="button" onClick={onBack} className={styles.mobileBarBack}>
              <BackIcon />
            </button>
          )}
          <nav aria-label="首页入口" className="flex items-center min-[360px]:gap-1">
            {navItems.map((item) => renderNavItem(item, true))}
          </nav>
        </div>
        <a href="/about" className={styles.aboutLink}>
          <span className={styles.navIcon}><AboutIcon /></span>
        </a>
      </div>

      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        {showBack && (
          <div className={styles.backWrap}>
            <div className={styles.navItem}>
              <button type="button" onClick={onBack} className={styles.backButton}>
                <BackIcon />
              </button>
              <span className={styles.tooltip}>返回</span>
            </div>
          </div>
        )}

        <nav aria-label="首页入口" className={styles.nav}>
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <div className={styles.aboutWrap}>
          <div className={styles.navItem}>
            <a href="/about" className={styles.aboutLink}>
              <span className={styles.navIcon}><AboutIcon /></span>
            </a>
            <span className={styles.tooltip}>关于</span>
          </div>
        </div>
      </aside>
    </>
  );
}
