"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  FolderIcon,
  DollarLineIcon,
  GroupIcon,
  BoltIcon,
  ChatIcon,
  ShootingStarIcon,
  PencilIcon,
  FileIcon,
  MailIcon,
  UserIcon,
  LockIcon,
  SportsBallsIcon,
  CasinoSlotIcon,
  GiftBoxIcon
} from "../icons/index";
import { Gift } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  
  {
    icon: <CalenderIcon />,
    name: "Reporting & BI",
    subItems: [
      {
        name: "Gaming Activities",
        path: "/report/gaming_activities",
        pro: false,
      },
      { name: "Network Sales", path: "/report/network_sales", pro: false },
      {
        name: "Net Cash Report",
        path: "/report/net_cash_report",
        pro: false,
      },
      {        name: "Retail Cash Report",        path: "/report/retail_cash_report",    pro: false,      },
         {
        name: "Money Transactions",
        path: "/report/money_transactions",
        pro: false,
      },
     {
           name: "Tax Report",
           path: "/report/tax_report", 
           pro: false
           },
    ],
  },

  {
    icon: <TableIcon />,
    name: "Tickets",
    subItems: [
      { name: "Quick Bet Search", path: "/tickets/quick_bet", pro: false },
      { name: "Ticket On Hold", path: "/tickets/ticket-on-hold", pro: false },
      { name: "Open Bet (Sports)", path: "/tickets/open_bet", pro: false },
      { name: "Bets History", path: "/tickets/bets-history", pro: false },
      { name: "Pending Cashout Bets", path: "/tickets/pending-cashout-bets", pro: false },
      
    ],
  }, 
  
  {
    icon: <UserCircleIcon />,
    name: "Player Management",
    subItems: [
      { name: "Player Search", path: "/player-management/player-search", pro: false },
      { name: "Online Players Report", path: "/player-management/online-players-report", pro: false },
      { name: "Registration Report", path: "/player-management/registration-report", pro: false },
      { name: "Player Segmentation", path: "/player-management/player-segmentation", pro: false },
      { name: "Inactive Players Report", path: "/player-management/inactive-players-report", pro: false },
      { name: "Frozen Account Report", path: "/player-management/frozen-account-report", pro: false },
    ],
  },

  {
    icon: <GroupIcon />,
    name: "Network",
    subItems: [
      { name: "Agency List", path: "/network/agency-list", pro: false },
      { name: "Pending Requests", path: "/network/pending-requests", pro: false },
      { name: "Add New Agent", path: "/network/add-new-agent", pro: false },
      { name: "Commissions", path: "/network/commissions", pro: false },      
    ],
  },

  {
    icon: <DollarLineIcon />,
    name: "Banking",
    subItems: [
      { name: "Deposits/Withdrawals Manager", path: "/banking/deposits-withdrawals", pro: false },
      { name: "Retail Cash Sales", path: "/banking/retail-cash-sales", pro: false },
      { name: "CashFlow", path: "/banking/cashflow", pro: false },
    ]
  },

  {
    icon: <Gift />,
    name: "Bonus Management",
    subItems: [
      { name: "Player Bonuses", path: "/bonus-management/player-bonuses", pro: false },
      { name: "Bonus Campaigns", path: "/bonus-management/bonus-campaigns", pro: false },
      { name: "Multibet Bonus", path: "/bonus-management/multibet-bonus", pro: false },
      { name: "Grant Mass Bonuses", path: "/bonus-management/grant-mass-bonuses", pro: false },
      // { name: "Mass Free Spins", path: "/bonus-management/mass-free-spins", pro: false },
      { name: "Cashout", path: "/bonus-management/cashout", pro: false },
      { name: "Player Bonuses Report", path: "/bonus-management/player-bonuses-report", pro: false },
      { name: "Power Bonus Report", path: "/bonus-management/power-bonus-report", pro: false },
    ],
  },

  {
    icon: <ShootingStarIcon />,
    name: "Jackpots",
    subItems: [
      { name: "Weekly Jackpots", path: "/jackpots/weekly-jackpots", pro: false },
      { name: "Ticket Jackpots", path: "/jackpots/ticket-jackpots", pro: false },
      { name: "Tickets", path: "/jackpots/jackpot-tickets", pro: false },
    ]
  },

  {
    icon: <ChatIcon />,
    name: "Communications",
    subItems: [
      { name: "Player Messages", path: "/communications/player-messages", pro: false },
      { name: "Network Messsages", path: "/communications/network-messages", pro: false },
      { name: "Mass Inbox Messages", path: "/communications/mass-inbox-messages", pro: false },
      { name: "SMS settings", path: "/communications/sms-settings", pro: false },
    ]
  },

  {
    icon: <PencilIcon />,
    name: "Risk Management",
    subItems: [
      { name: "Betting Parameters", path: "/risk-management/betting-parameters", pro: false },
      { name: "Liability", path: "/risk-management/liability", pro: false },
      { name: "Profitability", path: "/risk-management/profitability", pro: false },
      { name: "Manual Odds Adjustment", path: "/risk-management/manual-odds-adjustment", pro: false },
      { name: "Event & Odds Margins", path: "/risk-management/event-odds-margins", pro: false },
    ]
  },

  {
    icon: <SportsBallsIcon />,
    name: "Pools Management",
    subItems: [
      { name: "Fixtures", path: "/pools-management/fixtures", pro: false },
      { name: "Tickets", path: "/pools-management/tickets", pro: false },
      { name: "Coupon Tickets", path: "/pools-management/coupon-tickets", pro: false },
    ]
  },

  {
    icon: <FileIcon />,
    name: "Content Management",
    subItems: [
      { name: "Site Menu", path: "/content-management/site-menu", pro: false },
      { name: "Sports Menu", path: "/content-management/sports-menu", pro: false },
      { name: "Pages", path: "/content-management/pages", pro: false },
      { name: "Banners", path: "/content-management/banners", pro: false },
      { name: "Markets Manager", path: "/content-management/markets-manager", pro: false },
      { name: "Top Bets", path: "/content-management/top-bets", pro: false },
    ]
  },

  {
    icon: <CasinoSlotIcon />,
    name: "Casino",
    path: "/casino",
  },

  {
    icon: <GiftBoxIcon />,
    name: "Promotions",
    path: "/promotions",
  },

  {
    icon: <UserIcon />,
    name: "User Management",
    subItems: [
      { name: "Users", path: "/user-management/users", pro: false },
      { name: "Roles & Permissions", path: "/user-management/roles-permissions", pro: false },
      { name: "Activity Logs", path: "/user-management/activity-logs", pro: false },  
    ]
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Configurations",
    subItems: [
      { name: "General", path: "/configurations/general", pro: false },
      // { name: "Commision Setting", path: "/configurations/commission-setting", pro: false },
      // { name: "Commision Bonus Group", path: "/configurations/commission-bonus-group", pro: false },
      // { name: "Payment Methods", path: "/configurations/payment-methods", pro: false },
      // { name: "Game Keys", path: "/configurations/game-keys", pro: false },
      { name: "Tipster Settings", path: "/configurations/tipster-settings", pro: false },
      { name: "Exposure Monitor Settings", path: "/configurations/exposure-monitor-settings", pro: false },
    ]
  },
  {
    icon: <LockIcon />,
    name: "Change Password",
    path: "/change-password",
  },
  // {
  //   icon: <PieChartIcon />,
  //   name: "Charts",
  //   subItems: [
  //     { name: "Line Chart", path: "/line-chart", pro: false },
  //     { name: "Bar Chart", path: "/bar-chart", pro: false },
  //   ],
  // },
  // {
  //   icon: <BoxCubeIcon />,
  //   name: "UI Elements",
  //   subItems: [
  //     { name: "Alerts", path: "/alerts", pro: false },
  //     { name: "Avatar", path: "/avatars", pro: false },
  //     { name: "Badge", path: "/badge", pro: false },
  //     { name: "Buttons", path: "/buttons", pro: false },
  //     { name: "Images", path: "/images", pro: false },
  //     { name: "Videos", path: "/videos", pro: false },
  //   ],
  // },
  // {
  //   icon: <PlugInIcon />,
  //   name: "Authentication",
  //   subItems: [
  //     { name: "Sign In", path: "/signin", pro: false },
  //     { name: "Sign Up", path: "/signup", pro: false },
  //   ],
  // },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex flex-col items-center max-w-md ">
              <h1 className="text-xl font-semibold text-warning-400 dark:text-warning-500 pb-2">
                SportBook{" "}
                <span className="text-black dark:text-white">Engine</span>
              </h1>
              <h2 className="text-md uppercase font-semibold text-black dark:text-white/90">
                Software
              </h2>
            </div>
          ) : (
            <div className="flex-col items-center max-w-md mx-auto hidden dark:block">
              <h1 className="text-sm font-semibold text-warning-400  dark:text-warning-500 pb-2">
                SportBook{" "}
                <span className="text-black dark:text-white">Engine</span>
              </h1>
              <h2 className="text-xs uppercase font-semibold text-black dark:text-white/90">
                Software
              </h2>
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
