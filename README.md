## Yandex Reviews App

Тестовое приложение для демонстрации получения отзывов по компаниям

### Развёртывание
1. `$ git clone git@github.com:mikhailmatveev/tickets-crm.git`
2. `$ composer install`
3. `$ npm install`
4. `$ cp .env.example .env`
5. `Настроить .env`
6. `$ php artisan key:generate`

### Пример запуска парсера из консоли

`$ npm run parse:url -- "https://yandex.ru/maps/org/samoye_populyarnoye_kafe/1010501395/reviews/"`

### Логирование работы парсера

`$ npm run parse:url -- "https://yandex.ru/maps/org/samoye_populyarnoye_kafe/1010501395/reviews/" 2>&1 | tee parser.log`

### Эксперименты с парсером

В ходе экспериментов обнаружилось, что API Яндекса не может отдать больше 600 отзывов, в связи с чем приходится экспериментировать с разным набором параметров в урлах вида fetchReviews.

Например, меняя параметр ranking, можно получить разные выдачи и потом все эти выдачи объединить в одну с исключением повторяющихся записей.
