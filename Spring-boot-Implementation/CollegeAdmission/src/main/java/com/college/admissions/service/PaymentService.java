package com.college.admissions.service;

import com.college.admissions.entity.Payment;
import com.college.admissions.entity.Application;
import com.college.admissions.repository.PaymentRepository;
import com.college.admissions.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ApplicationRepository applicationRepository;

    // Constructor injection (IMPORTANT)
    public PaymentService(PaymentRepository paymentRepository,
                          ApplicationRepository applicationRepository) {
        this.paymentRepository = paymentRepository;
        this.applicationRepository = applicationRepository;
    }

    public Payment save(Payment payment) {

        // Save payment first
        Payment savedPayment = paymentRepository.save(payment);

        // IMPORTANT: Update application status if payment SUCCESS
        if ("SUCCESS".equalsIgnoreCase(savedPayment.getPaymentStatus())) {

            Integer applicationId =
                    savedPayment.getApplication().getApplicationId();

            Application application =
                    applicationRepository.findById(applicationId).orElse(null);

            if (application != null) {

                application.setStatus(Application.Status.SUBMITTED);

                applicationRepository.save(application);

                System.out.println("Application status updated to SUBMITTED");
            }
        }

        return savedPayment;
    }

    public List<Payment> getAll() {
        return paymentRepository.findAll();
    }

    public Payment getById(Integer id) {
        return paymentRepository.findById(id).orElse(null);
    }
}
