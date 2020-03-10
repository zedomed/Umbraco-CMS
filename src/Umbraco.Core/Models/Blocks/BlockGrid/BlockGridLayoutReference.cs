using System;
using System.Runtime.Serialization;
using Umbraco.Core.Models.PublishedContent;

namespace Umbraco.Core.Models.Blocks
{
    /// <summary>
    /// Represents a layout item for the Block List editor
    /// </summary>
    [DataContract(Name = "blockListLayout", Namespace = "")]
    public class BlockGridLayoutReference : IBlockElement<IPublishedElement>
    {
        public BlockGridLayoutReference(Udi udi, IPublishedElement settings, String gridColumn)
        {
            Udi = udi ?? throw new ArgumentNullException(nameof(udi));
            Settings = settings; // can be null
            GridColumn = gridColumn;
        }

        /// <summary>
        /// The Id of the data item
        /// </summary>
        [DataMember(Name = "udi")]
        public Udi Udi { get; }

        /// <summary>
        /// The amount of columns the item should span
        /// </summary>
        [DataMember(Name = "gridColumn")]
        public String GridColumn { get; }

        /// <summary>
        /// The settings for the layout item
        /// </summary>
        [DataMember(Name = "settings")]
        public IPublishedElement Settings { get; }

    }
}
