"use client";

import { useEffect } from "react";

const ServiceWorkerRegistrar = () => {
        useEffect(() => {
                if (process.env.NODE_ENV === "development") {
                        return;
                }

                if (!("serviceWorker" in navigator)) {
                        return;
                }

                const registerServiceWorker = () => {
                        navigator.serviceWorker
                                .register("/sw.js")
                                .catch((error) => {
                                        console.error("Service worker registration failed", error);
                                });
                };

                window.addEventListener("load", registerServiceWorker);

                return () => {
                        window.removeEventListener("load", registerServiceWorker);
                };
        }, []);

        return null;
};

export default ServiceWorkerRegistrar;
