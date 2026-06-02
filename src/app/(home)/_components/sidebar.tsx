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

    if ("link" in item) {
      return (
        <div key={item.label} className={styles.navItem}>
          <a href={item.link} target="_blank" rel="noopener noreferrer" className={className}>
            {inner}
          </a>
          <span className={styles.tooltip}>{item.label}</span>
        </div>
      );
    }

    return (
      <div key={item.label} className={styles.navItem}>
        <button type="button" onClick={() => onTabChange(item.id)} className={className}>
          {inner}
        </button>
        <span className={styles.tooltip}>{item.label}</span>
      </div>
    );
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className={styles.mobileBar}>
        <div className="flex items-center gap-2">
          {showBack && (
            <button type="button" onClick={onBack} className={styles.mobileBarBack}>
              <BackIcon />
            </button>
          )}
          <nav className="flex items-center gap-1">
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

        <nav className={styles.nav}>
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
