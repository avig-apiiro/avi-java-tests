package com.bfm.beam2.endToEnd;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;

import com.bfm.beam2.annotation.Beam2Client;
import com.bfm.beam2.annotation.Beam2Method;
import com.bfm.beam2.annotation.Param;
import com.bfm.beam2.annotation.Beam2Service;
import com.bfm.beam2.endToEnd.domain.Fraction;

public class C2S_Param_BmsSerializable {

    @Beam2Service(sourceId = 123)
    public static class MathService {
        @Beam2Method(command = "add")
        public Fraction add(@Param("x") Fraction x, @Param("y") Fraction y) {
            return x.add(y);
        }
    }

    @Beam2Client(sourceId = 123)
    public static interface ClientMathService {
        @Beam2Method(command = "add")
        public Fraction add(@Param("x") Fraction x, @Param("y") Fraction y);
    }

    C2S<MathService, ClientMathService> c2s;

    @Before
    public void init() throws Exception {
        c2s = new C2S<>(MathService.class, ClientMathService.class);
    }

    @Test
    public void add() throws Exception {
        Fraction sum = c2s.client.add( Fraction.HALF(), Fraction.HALF() );
        assertTrue("Sum: ",  Fraction.ONE().isSameValue(sum));
    }

}
