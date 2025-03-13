import MyButton from '@/components/MyButton';
import MyInput from '@/components/MyInput';
import { useAppSelector } from '@/hooks/hooks';
import { useAuthActions } from '@/hooks/userHooks';
import LoginSignup from '@/layouts/LoginSignup';
import { returnType, validateEmail, validateName, validatePassword } from '@/utils/validation';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [formDataError, setFormDataError] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  type FormField = 'name' | 'email' | 'password' | 'confirmPassword';
  const validationMap = {
    name: validateName,
    email: validateEmail,
    password: validatePassword,
    confirmPassword: (value: string): returnType => {
      return {
        isValid: value === formData.password,
        error: value !== formData.password ? 'Password does not match' : ''
      }
    }
  }

  const onChangeInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const fieldName = name as FormField;
    const validation = validationMap[fieldName];
    const result = validation(value);
    setFormDataError({ ...formDataError, [fieldName]: result.error });
  }

  const { isAuthenticated } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  const { register, loading } = useAuthActions();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate])

  const validateInputs = (): boolean => {
    const errors = { name: "", email: "", password: "", confirmPassword: "" };
    let isFormValid: boolean[] = [];

    Object.keys(formData).forEach((key) => {
      const field = key as FormField;
      const validateFn = validationMap[field];
      const validationResult = validateFn(formData[field]);
      errors[field] = validationResult.error;
      isFormValid.push(validationResult.isValid);
    });

    setFormDataError(errors);
    return isFormValid.every(isValid => isValid);
  }

  const handleSignup = async () => {
    if (!validateInputs()) return;
    await register({ name: formData.name, email: formData.email, password: formData.password });
  }
  return (
    <LoginSignup>
      <h1 className="text-4xl font-bold m-4 text-gray-600 dark:text-[#d1d1d1]">Sign-Up</h1>
      <div className="flex flex-col w-[90%] items-center">
        <MyInput
          value={formData.name}
          onChange={onChangeInputs}
          label="Name"
          placeholder="Name"
          error={formDataError.name}
          disabled={loading}
          name='name'
        />
        <MyInput
          value={formData.email}
          onChange={onChangeInputs}
          label="Email"
          placeholder="Email"
          error={formDataError.email}
          disabled={loading}
          name='email'
        />
        <MyInput
          value={formData.password}
          onChange={onChangeInputs}
          label="Password"
          placeholder="Password"
          type='password'
          error={formDataError.password}
          disabled={loading}
          name='password'
        />
        <MyInput
          value={formData.confirmPassword}
          onChange={onChangeInputs}
          label="Confirm Password"
          placeholder="Confirm Password"
          type='password'
          error={formDataError.confirmPassword}
          disabled={loading}
          name='confirmPassword'
        />
        <MyButton
          onClick={handleSignup}
          title="SIGN-UP"
          loading={loading}
        />
        <div className='mt-3 w-full flex flex-col items-center'>
          <h1 className='text-xl font-bold mt-3'>OR</h1>
          <p className='text-xl'>Already have an account?
            <Link to={"/login"} className='ml-2 text-xl text-blue-500 font-bold'>Login</Link>
          </p>
        </div>
      </div>
    </LoginSignup>
  )
}

export default Signup