"use client";

import { FC, ReactNode } from "react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

interface LayoutProps {
  children: ReactNode;
}

const Providers: FC<LayoutProps> = ({ children }) => {
  return <AppProvider i18n={enTranslations}>{children}</AppProvider>;
};

export default Providers;
