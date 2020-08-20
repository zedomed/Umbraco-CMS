using System;
using System.Collections.Generic;
using System.Text;

namespace Umbraco.Core.CodeAnnotations
{
    [AttributeUsage(AttributeTargets.Assembly)]
    public class UmbracoSuppressVolatileAttribute : Attribute
    {
    }
}
