package com.apiiro.avigtest.protoapi;

import io.grpc.Grpc;
import io.grpc.InsecureServerCredentials;
import io.grpc.Server;
import java.io.IOException;

public class ProtoapiApplication {

    public static void main(String[] args) {
        ProtoapiApplication app = new ProtoapiApplication();
        try {
            app.start();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    Server server;
    private void start() throws IOException, InterruptedException {


        server = Grpc.newServerBuilderForPort(5005, InsecureServerCredentials.create())
                .addService(new ProtoServerImpl())
                .build()
                .start();

        server.awaitTermination();
    }

 }
