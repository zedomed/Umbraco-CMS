using System.Runtime.Serialization;

namespace Umbraco.Web.Models.ContentEditing
{
    [DataContract(Name = "contentPublish", Namespace = "")]
    public class ContentPublish
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }

        [DataMember(Name = "includeDescendants")]
        public bool IncludeDescendants { get; set; }

        [DataMember(Name = "publishDrafts")]
        public bool PublishDrafts { get; set; }

        [DataMember(Name = "cultures")]
        public string[] Cultures { get; set; }
    }
}
