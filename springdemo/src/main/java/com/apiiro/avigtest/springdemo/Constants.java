package com.apiiro.avigtest.springdemo;

public class Constants {
    public static final String PARAMNAME = "success";
    public static final String PARAMNAME_BRACKETS = "/{success}";
    public static final String PARAMNAME_P1 = "/{p1}";
    public static final String PARAMNAME_P2 = "/{p2}";

    public static final String API = "/a";
    public static final String API_V1 = API + "/v1";
    public static final String PARTNERS = "/p";
    public static final String PARTNER_ID = "/{partnerId}";
    public static final String PARTNER = PARTNERS + PARTNER_ID;
    public static final String BENEFITS = "/c";

    public static final String TST = API_V1 + PARTNER + BENEFITS;

    public static class Internal {
        private static final String TWIST = "/twist";
        public static final String TWIST_AND_SHOUT = TWIST + "/shout";
    }
}
