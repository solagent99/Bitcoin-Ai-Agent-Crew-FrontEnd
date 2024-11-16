import React from "react";
import { Metadata } from "next";
import { ApplicationLayout } from "../application-layout";

export const metadata: Metadata = {
  title: "Crews",
};

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicationLayout>{children}</ApplicationLayout>;
}
