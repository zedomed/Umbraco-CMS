using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;

namespace Umbraco.Core.CodeAnnotations
{
    /// <summary>
    /// Attribute which marks a method or class as volatile, 
    /// causing the method, or any method from the marked class,
    /// to issue an error if invoked.
    /// Can be suppressed to a warning with UmbracoSuppressVolatileAttribute.
    /// </summary>
    public class UmbracoVolatileAttribute : Attribute
    {

    }
}
