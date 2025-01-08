-- Add logging function
CREATE OR REPLACE FUNCTION log_submission_attempt()
RETURNS trigger AS $$
BEGIN
  -- Log the incoming data
  RAISE LOG 'Submission attempt: email=%, survey_data=%, recommendations=%, summary=%',
    NEW.email,
    NEW.survey_data,
    NEW.recommendations,
    NEW.summary;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create logging trigger that runs before validation
CREATE TRIGGER log_submission_attempt_trigger
  BEFORE INSERT ON email_submissions
  FOR EACH ROW
  EXECUTE FUNCTION log_submission_attempt();

-- Update validation trigger with enhanced error reporting
CREATE OR REPLACE FUNCTION validate_submission()
RETURNS trigger AS $$
DECLARE
  validation_errors text[];
BEGIN
  -- Initialize error collection
  validation_errors := ARRAY[]::text[];

  -- Email validation with detailed error
  IF NOT is_valid_email(NEW.email) THEN
    validation_errors := array_append(
      validation_errors,
      format('Invalid email format: %s', NEW.email)
    );
  END IF;

  -- JSON validation with detailed errors
  IF jsonb_typeof(NEW.survey_data) != 'object' THEN
    validation_errors := array_append(
      validation_errors,
      format('Invalid survey_data format: %s', jsonb_typeof(NEW.survey_data))
    );
  END IF;

  IF jsonb_typeof(NEW.recommendations) != 'array' THEN
    validation_errors := array_append(
      validation_errors,
      format('Invalid recommendations format: %s', jsonb_typeof(NEW.recommendations))
    );
  END IF;

  -- Rate limiting check with detailed error
  IF EXISTS (
    SELECT 1 FROM email_submissions
    WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour'
  ) THEN
    validation_errors := array_append(
      validation_errors,
      format('Rate limit exceeded for email: %s', NEW.email)
    );
  END IF;

  -- If any validation errors occurred, raise detailed exception
  IF array_length(validation_errors, 1) > 0 THEN
    RAISE LOG 'Validation failed: %', array_to_string(validation_errors, '; ');
    RAISE EXCEPTION 'Validation failed: %', array_to_string(validation_errors, '; ');
  END IF;

  -- Log successful validation
  RAISE LOG 'Validation successful for email: %', NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;