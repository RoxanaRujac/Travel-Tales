package com.project.travel.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidJournalTitleValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidJournalTitle {
    String message() default "Journal title must be 3-100 characters and contain at least one letter";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}