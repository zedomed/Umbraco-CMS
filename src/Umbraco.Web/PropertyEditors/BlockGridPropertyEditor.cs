using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.PropertyEditors;
using Umbraco.Core.Services;

namespace Umbraco.Web.PropertyEditors
{
    /// <summary>
    /// Represents a block grid property editor.
    /// </summary>
    [DataEditor(
        Constants.PropertyEditors.Aliases.BlockGrid,
        "Block Grid",
        "blockgrid",
        ValueType = ValueTypes.Json,
        Group = Constants.PropertyEditors.Groups.Lists,
        Icon = "icon-thumbnails-small")]
    public class BlockGridPropertyEditor : BlockEditorPropertyEditor
    {
        public BlockGridPropertyEditor(ILogger logger)
            : base(logger)
        { }

        #region Pre Value Editor

        protected override IConfigurationEditor CreateConfigurationEditor() => new BlockGridConfigurationEditor();

        #endregion

    }
}
