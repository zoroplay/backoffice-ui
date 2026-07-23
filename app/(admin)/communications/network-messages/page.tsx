"use client";

import { withAuth } from "@/utils/withAuth";
import InactiveCommunicationPage from "../components/InactiveCommunicationPage";

function NetworkMessagesPage() {
  return <InactiveCommunicationPage title="Network Messages" />;
}

export default withAuth(NetworkMessagesPage);
