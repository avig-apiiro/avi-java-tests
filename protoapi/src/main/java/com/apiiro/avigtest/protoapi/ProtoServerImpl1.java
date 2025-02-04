package com.apiiro.avigtest.protoapi;

import io.grpc.stub.StreamObserver;
import protoapi.ProtoServer1Grpc;
import protoapi.Server1;

public class ProtoServerImpl1 extends ProtoServer1Grpc.ProtoServer1ImplBase {
    @Override
    public void getPerson(Server1.PersonRequest1 request, StreamObserver<Server1.Person1> responseObserver) {
        super.getPerson(request, responseObserver);
    }

    @Override
    public void getFullPerson(Server1.PersonRequest1 request, StreamObserver<Server1.Person1> responseObserver) {
        String email = request.getName() + "@email.com";
        Server1.Person1 reply = buildPerson(request.getName(), email, "1234");
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }


    public Server1.Person1 buildPerson(String name, String email, String creditCard) {
        return Server1.Person1.newBuilder()
            .setName(name)
            .setEmail(email)
            .setUsername(name)
            .setCreditCardNumber(creditCard)
            .build();
    }
}