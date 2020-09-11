﻿using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Controllers;
using Umbraco.Core;
using Umbraco.Core.Mapping;
using Umbraco.Core.Models;
using Umbraco.Core.Security;
using Umbraco.Core.Services;
using Umbraco.Web.BackOffice.Controllers;
using Umbraco.Web.Common.Attributes;
using Umbraco.Web.Models.ContentEditing;
using Umbraco.Web.Models.Trees;
using Umbraco.Web.Security;
using Umbraco.Web.Services;
using Umbraco.Web.Trees;

namespace Umbraco.Web.Editors
{
    /// <summary>
    ///     The API controller used for using the list of sections
    /// </summary>
    [PluginController(Constants.Web.Mvc.BackOfficeApiArea)]
    public class SectionController : UmbracoAuthorizedJsonController
    {
        private readonly IControllerFactory _controllerFactory;
        private readonly IDashboardService _dashboardService;
        private readonly ILocalizedTextService _localizedTextService;
        private readonly ISectionService _sectionService;
        private readonly ITreeService _treeService;
        private readonly UmbracoMapper _umbracoMapper;
        private readonly IWebSecurityAccessor _webSecurityAccessor;

        public SectionController(
            IWebSecurityAccessor webSecurityAccessor,
            ILocalizedTextService localizedTextService,
            IDashboardService dashboardService, ISectionService sectionService, ITreeService treeService,
            UmbracoMapper umbracoMapper, IControllerFactory controllerFactory)
        {
            _webSecurityAccessor = webSecurityAccessor;
            _localizedTextService = localizedTextService;
            _dashboardService = dashboardService;
            _sectionService = sectionService;
            _treeService = treeService;
            _umbracoMapper = umbracoMapper;
            _controllerFactory = controllerFactory;
        }

        public IEnumerable<Section> GetSections()
        {
            var sections = _sectionService.GetAllowedSections(_webSecurityAccessor.WebSecurity.GetUserId().ResultOr(0));

            var sectionModels = sections.Select(_umbracoMapper.Map<Section>).ToArray();

            // this is a bit nasty since we'll be proxying via the app tree controller but we sort of have to do that
            // since tree's by nature are controllers and require request contextual data
            var appTreeController =
                new ApplicationTreeController(_treeService, _sectionService, _localizedTextService, _controllerFactory)
                {
                    ControllerContext = ControllerContext
                };

            var dashboards = _dashboardService.GetDashboards(_webSecurityAccessor.WebSecurity.CurrentUser);

            //now we can add metadata for each section so that the UI knows if there's actually anything at all to render for
            //a dashboard for a given section, then the UI can deal with it accordingly (i.e. redirect to the first tree)
            foreach (var section in sectionModels)
            {
                var hasDashboards = dashboards.TryGetValue(section.Alias, out var dashboardsForSection) &&
                                    dashboardsForSection.Any();
                if (hasDashboards) continue;

                // get the first tree in the section and get its root node route path
                var sectionRoot = appTreeController.GetApplicationTrees(section.Alias, null, null).Result;
                section.RoutePath = GetRoutePathForFirstTree(sectionRoot);
            }

            return sectionModels;
        }

        /// <summary>
        ///     Returns the first non root/group node's route path
        /// </summary>
        /// <param name="rootNode"></param>
        /// <returns></returns>
        private string GetRoutePathForFirstTree(TreeRootNode rootNode)
        {
            if (!rootNode.IsContainer || !rootNode.ContainsTrees)
                return rootNode.RoutePath;

            foreach (var node in rootNode.Children)
            {
                if (node is TreeRootNode groupRoot)
                    return GetRoutePathForFirstTree(groupRoot); //recurse to get the first tree in the group
                return node.RoutePath;
            }

            return string.Empty;
        }

        /// <summary>
        ///     Returns all the sections that the user has access to
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Section> GetAllSections()
        {
            var sections = _sectionService.GetSections();
            var mapped = sections.Select(_umbracoMapper.Map<Section>);
            if (_webSecurityAccessor.WebSecurity.CurrentUser.IsAdmin())
                return mapped;

            return mapped.Where(x => _webSecurityAccessor.WebSecurity.CurrentUser.AllowedSections.Contains(x.Alias)).ToArray();
        }
    }
}
