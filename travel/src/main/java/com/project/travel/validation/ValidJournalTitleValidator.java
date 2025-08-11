package com.project.travel.validation;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class ValidJournalTitleValidator implements ConstraintValidator<ValidJournalTitle, String> {

    private static final Pattern CONTAINS_LETTER = Pattern.compile(".*[a-zA-ZăâîșțĂÂÎȘȚ].*");

    @Override
    public boolean isValid(String title, ConstraintValidatorContext context) {
        if (title == null) {
            return true;
        }

        String trimmedTitle = title.trim();

        if (trimmedTitle.length() < 3 || trimmedTitle.length() > 100) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Title must be between 3 and 100 characters")
                    .addConstraintViolation();
            return false;
        }

        if (!CONTAINS_LETTER.matcher(trimmedTitle).matches()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Title must contain at least one letter")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}