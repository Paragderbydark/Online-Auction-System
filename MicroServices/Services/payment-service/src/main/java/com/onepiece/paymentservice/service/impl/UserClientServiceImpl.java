package com.onepiece.paymentservice.service.impl;

import com.onepiece.paymentservice.dto.UserPaymentDTO;
import com.onepiece.paymentservice.service.UserClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserClientServiceImpl implements UserClientService {

    private static final Logger logger = LoggerFactory.getLogger(UserClientServiceImpl.class);

    private final RestTemplate restTemplate;


    private final String USER_SERVICE_URL = "http://user-service/api/v1/user-service";

    @Autowired
    public UserClientServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public UserPaymentDTO getUserPaymentDTOById(int userId) {
        String url = USER_SERVICE_URL + "/profile/" + userId;

        try {
            UserPaymentDTO profile = restTemplate.getForObject(url, UserPaymentDTO.class);

            return profile;

        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("User profile not found for userId {}: {}", userId, e.getMessage());
            return null;
        } catch (HttpClientErrorException.Forbidden | HttpClientErrorException.Unauthorized e) {
            logger.error("Security error trying to access user profile for {}: {}", userId, e.getMessage());
            throw new RuntimeException("Not authorized to access user profile.", e);
        } catch (Exception e) {
            logger.error("Error fetching user profile for userId {}: {}", userId, e.getMessage());
            return null;
        }
    }
}
