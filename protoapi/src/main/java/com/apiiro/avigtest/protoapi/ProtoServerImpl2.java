package com.apiiro.avigtest.protoapi;

import io.grpc.stub.StreamObserver;

public class ProtoServerImpl2 extends ProtoServer2Grpc.ProtoServer2ImplBase {
    @Override
    public void getPerson(Server2.PersonRequest2 request, StreamObserver<Server2.Person> responseObserver) {
        super.getPerson(request, responseObserver);
    }

    @Override
    public void getFullPerson(Server2.PersonRequest2 request, StreamObserver<Server2.Person> responseObserver) {
        String email = request.getName() + "@email.com";
        Server2.Person reply = buildPerson(request.getName(), email, "1234");
        responseObserver.onNext(reply);
        responseObserver.onCompleted();    }

    public Server2.Person buildPerson(String name, String email, String creditCard) {
        return Server2.Person.newBuilder()
            .setName(name)
            .setEmail(email)
            .setUsername(name)
            .setCreditCardNumber(creditCard)
            .build();
    }
}
