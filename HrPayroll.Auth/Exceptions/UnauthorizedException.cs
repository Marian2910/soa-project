using System;

namespace HrPayroll.Auth.Exceptions
{
    public class UnauthorizedException : Exception
    {
        public UnauthorizedException(string message) : base(message) { }
    }
}