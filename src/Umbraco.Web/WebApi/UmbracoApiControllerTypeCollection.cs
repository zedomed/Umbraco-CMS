﻿using System;
using System.Collections.Generic;
using Umbraco.Core.DependencyInjection;

namespace Umbraco.Web.WebApi
{
    // unless we want to modify the content of the collection
    // which we are not doing at the moment
    // we can inherit from BuilderCollectionBase and just be enumerable

    internal class UmbracoApiControllerTypeCollection : BuilderCollectionBase<Type>
    {
        public UmbracoApiControllerTypeCollection(IEnumerable<Type> items)
            : base(items)
        { }
    }
}
