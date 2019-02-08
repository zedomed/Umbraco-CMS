using System;
using System.Linq;
using Umbraco.Core.Cache;
using Umbraco.Core.Models;
using Umbraco.Core.PropertyEditors.ValueConverters;
using Umbraco.Core.Services;
using Umbraco.Web.PublishedCache;


namespace Umbraco.Web.Cache
{
    public sealed class DataTypeCacheRefresher : PayloadCacheRefresherBase<DataTypeCacheRefresher, DataTypeCacheRefresher.JsonPayload>
    {
        private readonly IPublishedSnapshotService _publishedSnapshotService;
        private readonly IdkMap _idkMap;

        public DataTypeCacheRefresher(AppCaches appCaches, IPublishedSnapshotService publishedSnapshotService, IdkMap idkMap)
            : base(appCaches)
        {
            _publishedSnapshotService = publishedSnapshotService;
            _idkMap = idkMap;
        }

        #region Define

        protected override DataTypeCacheRefresher This => this;

        public static readonly Guid UniqueId = Guid.Parse("35B16C25-A17E-45D7-BC8F-EDAB1DCC28D2");

        public override Guid RefresherUniqueId => UniqueId;

        public override string Name => "Data Type Cache Refresher";

        #endregion

        #region Refresher

        public override void Refresh(JsonPayload[] payloads)
        {
            //we need to clear the ContentType runtime cache since that is what caches the
            // db data type to store the value against and anytime a datatype changes, this also might change
            // we basically need to clear all sorts of runtime caches here because so many things depend upon a data type

            ClearAllIsolatedCacheByEntityType<IContent>();
            ClearAllIsolatedCacheByEntityType<IContentType>();
            ClearAllIsolatedCacheByEntityType<IMedia>();
            ClearAllIsolatedCacheByEntityType<IMediaType>();
            ClearAllIsolatedCacheByEntityType<IMember>();
            ClearAllIsolatedCacheByEntityType<IMemberType>();

            // zero id and key means "all"
            var isAll = payloads.Any(x => x.Id == 0 && x.Key == Guid.Empty);

            if (isAll)
            {
                // TODO: this is a bit extreme, we should have ways to clear only some types
                _idkMap.ClearCache();
            }
            else
            {
                foreach (var payload in payloads)
                    _idkMap.ClearCache(payload.Id);
            }

            // TODO: not sure I like these?
            TagsValueConverter.ClearCaches();
            SliderValueConverter.ClearCaches();

            // notify
            _publishedSnapshotService.Notify(payloads);

            base.Refresh(payloads);
        }

        // these events should never trigger
        // everything should be PAYLOAD/JSON

        public override void RefreshAll()
        {
            // TODO: this is temp, because we need to trigger a refresh for Core
            // but really, all this should be *in* Core and this should throw!
            Refresh(new[] { new JsonPayload() });
            //throw new NotSupportedException();
        }

        public override void Refresh(int id)
        {
            throw new NotSupportedException();
        }

        public override void Refresh(Guid id)
        {
            throw new NotSupportedException();
        }

        public override void Remove(int id)
        {
            throw new NotSupportedException();
        }

        #endregion

        #region Json

        public class JsonPayload
        {
            public JsonPayload()
            {
                // "all"
                Id = 0;
                Key = Guid.Empty;
            }

            public JsonPayload(int id, Guid key, bool removed)
            {
                Id = id;
                Key = key;
                Removed = removed;
            }

            public int Id { get; }

            public Guid Key { get; }

            public bool Removed { get; }

            // zero id and key means "all"
            public bool IsAll() => Id == 0 && Key == Guid.Empty;
        }

        #endregion
    }
}
