package com.travel.authentication.service;

import com.travel.authentication.dto.AuthDTO;
import com.travel.authentication.model.User;

public interface AuthService {
    /**
     * Method used for login
     *
     * @param auth the auth object
     * @return the owner for a succesfull login, null otherwise
     */
    User login(AuthDTO auth);
    User register(AuthDTO auth);
}
