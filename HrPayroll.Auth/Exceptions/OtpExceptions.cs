namespace HrPayroll.Auth.Exceptions
{
    public class OtpExpiredException : Exception
    {
        public OtpExpiredException(string message) : base(message) { }
    }

    public class OtpInvalidException : Exception
    {
        public OtpInvalidException(string message) : base(message) { }
    }
}
