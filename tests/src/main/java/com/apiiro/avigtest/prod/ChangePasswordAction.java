package com.apiiro.avigtest.prod;

import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;

public class ChangePasswordAction extends Action {

    public static final String FORWARD_changePassword = "changePassword";

    @Override
    public ActionForward execute(ActionMapping mapping, ActionForm form,
                                 HttpServletRequest request, HttpServletResponse response) throws IOException, SQLException, ServletException, NamingException {
        ChangePasswordForm changePasswordForm = (ChangePasswordForm) form;
        if (request.getMethod().equalsIgnoreCase("POST")
                && changePasswordForm.getPassword() != null
                && changePasswordForm.getPassword().length() > 0
                && changePasswordForm.getPassword().equals(changePasswordForm.getPasswordAgain())) {
                    Connection connection = null;
            try {
            } finally {
                if (connection != null) connection.close();
            }
            changePasswordForm.setPassword(null);
            changePasswordForm.setPasswordAgain(null);
        }
        return mapping.findForward(FORWARD_changePassword);
    }

}
