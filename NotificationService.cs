using Microsoft.Extensions.Caching.Memory;

namespace airq_webapp
{
    public class NotificationService
    {
        private readonly Timer _timer;
        private readonly IMemoryCache _cache;
        private readonly FcmService _fcmService;
        public NotificationService(IMemoryCache cache, FcmService fcmService)
        {
            _timer = new Timer(CheckConditionAndSendNotification, null, Timeout.Infinite, Timeout.Infinite);
            _cache = cache;
            _fcmService = fcmService;
        }

        public void StartTimer()
        {
            _timer.Change(TimeSpan.Zero, TimeSpan.FromMinutes(5));
        }
        private void CheckConditionAndSendNotification(object? state)
        {
            var cachedValue = _cache.Get<string>("airquality");
            if (cachedValue !=null)
               if(cachedValue.CompareTo("Bad") ==0 )
                {
                    SendNotification("Calitatea aerului este foarte scăzută și ar putea afecta sănătatea persoanelor din această încăpere!");
                }
                else if(cachedValue.CompareTo("Moderate") ==0)
                {
                    SendNotification("Calitatea aerului se află la un nivel moderat. Încercați să aerisiți încăperea!");
                }
        }
        private async void SendNotification(string message)
        {
            await _fcmService.SendNotificationAsync("all", "Air Quality Status", message);
        }
    }   
}
