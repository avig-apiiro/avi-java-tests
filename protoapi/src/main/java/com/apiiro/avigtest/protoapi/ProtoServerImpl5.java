package com.apiiro.avigtest.protoapi;


import io.grpc.stub.StreamObserver;

public class ProtoServerImpl5 extends ProtoServer5Grpc.ProtoServer5ImplBase {
    @Override
    public void getPerson(PersonRequest5 request, StreamObserver<Person5> responseObserver) {
        super.getPerson(request, responseObserver);
    }

    @Override
    public void getFullPerson(PersonRequest5 request, StreamObserver<Person5> responseObserver) {
        String email = request.getName() + "@email.com";
        Person5 reply = buildPerson(request.getName(), email, "1234");
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }

    public Person5 buildPerson(String name, String email, String creditCard) {
        return Person5.newBuilder()
            .setName(name)
            .setEmail(email)
            .setUsername(name)
            .setCreditCardNumber(creditCard)
            .build();
    }



    @Override
    public StreamObserver<PersonRequest5> streamClientStatus(StreamObserver<Person5> responseObserver) {
        return super.streamClientStatus(responseObserver);
    }
}
