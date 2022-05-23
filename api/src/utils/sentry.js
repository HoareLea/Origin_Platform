require('dotenv').config()
const Sentry= require("@sentry/node");
// Importing @sentry/tracing patches the global hub for tracing to work.
require("@sentry/tracing");
// import dotenv from "dotenv";
// import * as Sentry from "@sentry/node";
// // Importing @sentry/tracing patches the global hub for tracing to work.
// import "@sentry/tracing";

// Set environment variables from ../.env
// dotenv.config();

const initializeSentry = () => {
    // Initialize Sentry
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,
        release: process.env.SENTRY_RELEASE,
        environment: process.env.NODE_ENV,
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
        ],
    });

    // verifySentry();
}

const setSentryUser = (userEmail, userId) => {
    Sentry.setUser({ email: userEmail, id: userId });
}

const verifySentry = () => {
    // Verify
    const transaction = Sentry.startTransaction({
        op: "test",
        name: "My First Test Transaction",
    });

    setTimeout(() => {
        try {
            foo();
        } catch (e) {
            Sentry.captureException(e);
        } finally {
            transaction.finish();
        }
    }, 99);
}

module.exports = {initializeSentry, setSentryUser};