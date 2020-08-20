using System;
using System.Collections.Generic;
using System.Text;

namespace Umbraco.Core.CodeAnnotations
{
    /// <summary>
    /// Assembly level attribute which supresses 
    /// an UmbracoVolatile error to a warning
    /// </summary>
    [AttributeUsage(AttributeTargets.Assembly)]
    public class UmbracoSuppressVolatileAttribute : Attribute
    {
    }
}
