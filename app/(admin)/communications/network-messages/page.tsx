"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb"
import { withAuth } from "@/utils/withAuth";

const NetworkMessagesPage = () => {

 return (
    <div>
        <PageBreadcrumb pageTitle="Network Messages" />

        <div className="text-gray-500 dark:text-gray-50">
         Status: <span className="text-red-300">Not Active</span>
        </div>

    </div> 
 )
}

export default withAuth(NetworkMessagesPage);