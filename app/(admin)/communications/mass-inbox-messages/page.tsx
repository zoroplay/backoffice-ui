"use client";

import { withAuth } from "@/utils/withAuth";
import InactiveCommunicationPage from "../components/InactiveCommunicationPage";

function MassInboxMessagesPage() {
  return <InactiveCommunicationPage title="Mass Inbox Messages" />;
}

export default withAuth(MassInboxMessagesPage);
