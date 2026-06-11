"use client";
import GuestApp from "@/components/GuestApp";
import styles from "./controller.module.css";

export default function ControllerPage() {
  return (
    <main className={styles.main}>
      <GuestApp />
    </main>
  );
}
