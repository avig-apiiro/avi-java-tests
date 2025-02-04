package com.apiiro.avigtest.protoapi;

import io.grpc.stub.StreamObserver;
import com.apiiro.proto.ProtoServerOneGrpc;
import com.apiiro.proto.ServerOne;

public class ProtoServerImpl1 extends ProtoServerOneGrpc.ProtoServerOneImplBase {
    @Override
    public void getPerson(ServerOne.PersonRequest1 request, StreamObserver<ServerOne.PersonResponse1> responseObserver) {
        super.getPerson(request, responseObserver);
    }

    @Override
    public void getFullPerson(ServerOne.PersonRequest1 request, StreamObserver<ServerOne.PersonResponse1> responseObserver) {
        String email = request.getName() + "@email.com";
        ServerOne.PersonResponse1 reply = buildPerson(request.getName(), email, "1234");
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }


    public ServerOne.PersonResponse1 buildPerson(String name, String email, String creditCard) {
        return ServerOne.PersonResponse1.newBuilder()
            .setName(name)
            .setEmail(email)
            .setUsername(name)
            .setCreditCardNumber(creditCard)
            .build();
    }
}