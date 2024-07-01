namespace airq_webapp
{
    public class FcmService
    {
        public async Task<string> SendNotificationAsync(string topic, string title, string body)
        {
            var message = new FirebaseAdmin.Messaging.Message()
            {
                Notification = new FirebaseAdmin.Messaging.Notification()
                {
                    Title = title,
                    Body = body,
                },
                Topic = topic
            };

            string response = await FirebaseAdmin.Messaging.FirebaseMessaging.DefaultInstance.SendAsync(message);
            return response;
        }
    }
    public class NotificationRequest
    {
        public string Topic { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
    }
}
