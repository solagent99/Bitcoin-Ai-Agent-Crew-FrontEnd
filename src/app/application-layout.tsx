"use client";

import * as React from "react";
import { Avatar } from "@/components/catalyst/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/components/catalyst/dropdown";
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from "@/components/catalyst/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/catalyst/sidebar";
import { SidebarLayout } from "@/components/catalyst/sidebar-layout";
import {
  ChevronUpIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/16/solid";
import { usePathname } from "next/navigation";
import { useUserData } from "@/hooks/use-user-data";
import { Bot, ChartPie, CircleUser, LogOut, ListTodo, MessageSquareText, Scroll, TowerControl } from "lucide-react";
import SignOut from "@/components/auth/auth-signout";
import Image from "next/image";

function AccountDropdownMenu({
  anchor,
  userData,
}: {
  anchor: "top start" | "bottom end";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any;
}) {
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      {userData?.role === "Admin" && (
        <DropdownItem href="/admin">
          <WrenchScrewdriverIcon />
          <DropdownLabel>Admin</DropdownLabel>
        </DropdownItem>
      )}
      <DropdownItem href="/profile">
        <CircleUser className="mr-2 h-4 w-4" />
        <DropdownLabel>Profile</DropdownLabel>
      </DropdownItem>
      <DropdownItem>
        <LogOut className="mr-2 h-4 w-4" />
        <DropdownLabel><SignOut /></DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  );
}

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: userData, isLoading } = useUserData();

  const displayAddress = React.useMemo(() => {
    if (!userData?.stxAddress) return "";
    return `${userData.stxAddress.slice(0, 5)}...${userData.stxAddress.slice(
      -5
    )}`;
  }, [userData?.stxAddress]);

  // const displayAgentAddress = React.useMemo(() => {
  //   if (!userData?.agentAddress) return "No agents assigned";
  //   return `${userData.agentAddress.slice(
  //     0,
  //     5
  //   )}...${userData.agentAddress.slice(-5)}`;
  // }, [userData?.agentAddress]);

  const displayRole = React.useMemo(() => {
    if (
      !userData?.role ||
      userData.role === "" ||
      userData.role.toLowerCase() === "normal"
    ) {
      return "Normal User";
    }
    return userData.role;
  }, [userData?.role]);

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar src="/logos/aibtcdev-avatar-250px.png" square />
              </DropdownButton>
              <AccountDropdownMenu userData={userData} anchor="bottom end" />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <Avatar src="/logos/aibtcdev-avatar-250px.png" />
                <SidebarLabel>
                  <Image
                    src="/logos/aibtcdev-primary-logo-white-wide-1000px.png"
                    alt=""
                    width={400}
                    height={20}
                  />
                </SidebarLabel>
              </DropdownButton>
            </Dropdown>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              {/* <SidebarItem href="/dashboard" current={pathname === "/"}>
                <DashboardIcon />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem> */}
              <SidebarItem href="/chat" current={pathname === "/chat"}>
                <MessageSquareText />
                Chat
              </SidebarItem>
              <SidebarItem href="/collectives" current={pathname.startsWith("/collectives")}>
                <TowerControl />
                <SidebarLabel>Collectives</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/tasks" current={pathname.startsWith("/tasks")}>
                <ListTodo />
                Tasks
              </SidebarItem>
              <SidebarItem href="/agents" current={pathname.startsWith("/agents")}>
                <Bot />
                Agents
              </SidebarItem>
              {/* <SidebarItem
                href="/crews"
                current={pathname.startsWith("/crews")}
              >
                <Users />
                <SidebarLabel>Crews</SidebarLabel>
              </SidebarItem> */}
              {/* <SidebarItem
                href="/marketplace"
                current={pathname.startsWith("/marketplace")}
              >
                <Store />
                <SidebarLabel>Marketplace</SidebarLabel>
              </SidebarItem> */}
              {/* <SidebarItem
                href="/leaderboard"
                current={pathname.startsWith("/leaderboard")}
              >
                <ChartBarIcon />
                <SidebarLabel>Leaderboard</SidebarLabel>
              </SidebarItem> */}
              <SidebarItem
                href="/stats"
                current={pathname.startsWith("/stats")}
              >
                <ChartPie />
                <SidebarLabel>Stats</SidebarLabel>
              </SidebarItem>

            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="/terms" current={pathname === "/terms"}>
                <Scroll />
                <SidebarLabel>Terms of Service</SidebarLabel>
              </SidebarItem>
              {/* <SidebarItem>
                <Wallet />
                <SidebarLabel className="flex flex-col">
                  {isLoading ? "Loading..." : displayAgentAddress}
                  {userData?.agentAddress && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {userData.agentBalance !== null
                        ? `${userData.agentBalance.toFixed(5)} STX`
                        : "Loading balance..."}
                    </span>
                  )}
                </SidebarLabel>
              </SidebarItem> */}
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className=" p-4">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar initials="P" className="size-10" square alt="" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-zinc-950 dark:text-white">
                      {isLoading ? "Loading..." : displayAddress}
                    </span>
                    <span className="block truncate text-xs font-normal text-zinc-500 dark:text-zinc-400">
                      {isLoading ? "Loading..." : displayRole}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu userData={userData} anchor="top start" />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
