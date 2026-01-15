import { useMemo } from "react";
import { useTranslations } from "./useTranslations";

export const useMenuItems = (userRole) => {
  const { t } = useTranslations();

  const menuItems = useMemo(() => [
    { path: "/", label: t("menu.dashboard"), icon: "speedometer2", visible: true },
    {
      path: "/menus",
      label: t("menu.menus"),
      icon: "menu-app",
      visible: userRole === "admin" || userRole === "superadmin",
    },
    {
      path: "/pages",
      label: t("menu.pages"),
      icon: "file-earmark-text",
      visible: true,
    },
    { path: "/posts", label: t("menu.posts"), icon: "newspaper", visible: true },
    { path: "/tags", label: t("menu.tags"), icon: "tags", visible: true },
    {
      path: "/employees",
      label: t("menu.employees"),
      icon: "people",
      visible: true,
    },
    {
      path: "/testimonials",
      label: t("menu.testimonials"),
      icon: "chat-quote",
      visible: true,
    },
    {
      path: "/partners",
      label: t("menu.partners"),
      icon: "building",
      visible: true,
    },
    {
      path: "/admins",
      label: t("menu.admins"),
      icon: "shield-lock",
      visible: userRole === "superadmin",
    },
    {
      path: "/users",
      label: t("menu.users"),
      icon: "people",
      visible: userRole === "admin" || userRole === "superadmin",
    },
    {
      path: "/settings",
      label: t("menu.settings"),
      icon: "gear",
      visible: userRole === "admin" || userRole === "superadmin",
    },
  ], [t, userRole]);

  return menuItems;
};