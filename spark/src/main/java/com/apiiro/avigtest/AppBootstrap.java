package com.apiiro.avigtest;

import static com.apiiro.avigtest.AsciiBanner.asciiBanner;

import com.apiiro.avigtest.route.GreetingRoute;
import com.apiiro.avigtest.route.HostNameRoute;
import com.apiiro.avigtest.route.RandomResultsRoute;
import com.apiiro.avigtest.spark.SparkContext;
import com.apiiro.avigtest.spark.SparkContextConfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AppBootstrap {

    private static final Logger logger = LoggerFactory.getLogger(AppBootstrap.class);

    public static void main(String... args) {

        asciiBanner("application-ascii-banner.txt").ifPresent(AsciiBanner::print);

        logger.info("App started...");

        final SparkContext context = createSparkContext();

        // Comment out any of this entries to disable the respective routes.
        context.addRouteBuilder(new GreetingRoute());
        context.addRouteBuilder(new HostNameRoute());
        context.addRouteBuilder(new RandomResultsRoute());
    }

    private static SparkContext createSparkContext() {

        final SparkContextConfig config = new SparkContextConfig(4567, "/api");
        config.staticFileLocation("/staticFiles");
        config.threadPool(8);

        final SparkContext context = new SparkContext(config);

        context.enableLogLevelPerRequest();
        context.enableCorrelationId();
        context.enableErrorHandler();
        context.enableCors();
        context.enableCorsPreflight();
        context.logHttpRequest();
        context.logHttpRequestBody();
        context.defaultContentType("application/json");

        return context;
    }
}
