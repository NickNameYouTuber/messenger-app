import sys
import os
from datetime import datetime


VERSION_FILE = 'version/version'
VERSION_LOG_FILE = 'version/version_log'
LOGS_FILE = 'version/logs'


# Получение текущего времени в формате "дд.мм.гггг чч:мм:сс.мс"
def get_current_timestamp():
    now = datetime.now()
    return now.strftime('%d.%m.%Y %H:%M:%S.') + f'{now.microsecond // 1000:03d}'


# Добавление строки в начало файла
def prepend_to_file(filename, content):
    directory = os.path.dirname(filename)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

    existing = ''
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            existing = f.read().strip('\n')
    with open(filename, 'w') as f:
        f.write(content)
        if existing:
            f.write('\n' + existing)


# Чтение текущей версии
def read_current_version():
    try:
        with open(VERSION_FILE, 'r') as f:
            version = f.read().strip()
            if not version:
                raise ValueError("Файл версии пуст.")
            parts = version.split('.')
            if len(parts) != 3 or not all(p.isdigit() for p in parts):
                raise ValueError("Неверный формат версии.")
            return version
    except (FileNotFoundError, ValueError):
        default_version = '0.0.1'
        write_version(default_version)
        return default_version


# Запись версии в файл
def write_version(version):
    with open(VERSION_FILE, 'w') as f:
        f.write(version)


# Вывод текущей версии
def print_version():
    print(read_current_version())


# Вывод списка команд
def print_help():
    help_text = """Доступные команды:
    version          - Показать текущую версию
    patch            - Увеличить версию патча (0.0.x)
    minor            - Увеличить минорную версию (0.x.0)
    major            - Увеличить мажорную версию (x.0.0)
    drop             - Сбросить версию до 0.0.1 и очистить все логи
    clear            - Очистить логи команд
    undo             - Откат предыдущего действия. Откатить версию можно максимум на 1 назад!
    version_log      - Показать логи смены версий (используйте -n для вывода n записей)
    log              - Показать все логи (используйте -n для вывода n записей)"""
    print(help_text)


# Обновление версии
def update_version(update_type):
    current = read_current_version()
    major, minor, patch = map(int, current.split('.'))
    if update_type == 'patch':
        patch += 1
    elif update_type == 'minor':
        minor += 1
        patch = 0
    elif update_type == 'major':
        major += 1
        minor = 0
        patch = 0
    new_version = f'{major}.{minor}.{patch}'
    write_version(new_version)
    timestamp = get_current_timestamp()
    log_entry = f'[{new_version}] <- [{current}] [{timestamp}] {update_type}'
    prepend_to_file(VERSION_LOG_FILE, log_entry)
    print(f"Версия обновлена до {new_version}")


# Сброс версии и логов
def drop_version():
    for file in [VERSION_FILE, VERSION_LOG_FILE, LOGS_FILE]:
        directory = os.path.dirname(file)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

    write_version('0.0.1')
    open(VERSION_LOG_FILE, 'w').close()
    open(LOGS_FILE, 'w').close()
    print("Версия сброшена до 0.0.1, все логи очищены.")

# Очистка логов команд
def clear_logs():
    directory = os.path.dirname(LOGS_FILE)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

    open(LOGS_FILE, 'w').close()
    print("Логи команд очищены.")


# Откат к предыдущей версии
def undo_version():
    try:
        with open(VERSION_LOG_FILE, 'r') as f:
            lines = f.readlines()
            if not lines:
                print("Ошибка: Лог версий пуст.")
                return
            latest_line = lines[0].strip()
    except FileNotFoundError:
        print("Ошибка: Лог версий пуст.")
        return

    parts = latest_line.split(' <- ')
    if len(parts) != 2:
        print("Ошибка: Неверный формат записи в логе.")
        return
    new_part, rest = parts
    new_version = new_part[1:-1]
    old_part = rest.split('] [', 1)[0]
    old_version = old_part[1:]
    current = read_current_version()
    if current != new_version:
        print(f"Ошибка: Текущая версия {current} не совпадает с записью в логе {new_version}.")
        return
    write_version(old_version)
    timestamp = get_current_timestamp()
    log_entry = f'[{old_version}] <- [{new_version}] [{timestamp}] undo'
    prepend_to_file(VERSION_LOG_FILE, log_entry)
    print(f"Версия откачена до {old_version}")


# Вывод логов смены версий
def show_version_log(n=None):
    try:
        with open(VERSION_LOG_FILE, 'r') as f:
            lines = [line.strip() for line in f.readlines() if line.strip()]
            if not lines:
                print("Лог версий пуст.")
                return
            if n is not None:
                lines = lines[:n]
            for line in lines:
                print(line)
    except FileNotFoundError:
        print("Лог версий пуст.")

# Вывод всех логов
def show_logs(n=None):
    try:
        with open(LOGS_FILE, 'r') as f:
            lines = [line.strip() for line in f.readlines() if line.strip()]
            if not lines:
                print("Логи пусты.")
                return
            if n is not None:
                lines = lines[:n]
            for line in lines:
                print(line)
    except FileNotFoundError:
        print("Логи пусты.")


# Основная функция
def main():
    global VERSION_FILE  # чтобы можно было изменить глобальную переменную
    if len(sys.argv) < 2:
        print("Ошибка: Команда не указана. Используйте 'help' для списка команд.")
        sys.exit(1)

    # Если передано 2 и более аргументов, предполагаем, что первый аргумент – это путь к файлу версии,
    # а второй – команда.
    if len(sys.argv) >= 3:
        VERSION_FILE = sys.argv[1]
        command_args = sys.argv[2:]
    else:
        command_args = sys.argv[1:]

    log_entry = ' '.join(command_args)
    timestamp = get_current_timestamp()

    command = command_args[0]

    if command != "log":
        prepend_to_file(LOGS_FILE, f'[{timestamp}] {log_entry}')

    if command == 'version':
        print_version()
    elif command == 'help':
        print_help()
    elif command in ('patch', 'minor', 'major'):
        update_version(command)
    elif command == 'drop':
        drop_version()
    elif command == 'clear':
        clear_logs()
    elif command == 'undo':
        undo_version()
    elif command == 'version_log':
        n = None
        if len(command_args) >= 2 and command_args[1].startswith('-'):
            try:
                n = int(command_args[1][1:])
            except ValueError:
                print("Ошибка: Неверное число после флага.")
                sys.exit(1)
        show_version_log(n)
    elif command == 'log':
        n = None
        if len(command_args) >= 2 and command_args[1].startswith('-'):
            try:
                n = int(command_args[1][1:])
            except ValueError:
                print("Ошибка: Неверное число после флага.")
                sys.exit(1)
        show_logs(n)
    else:
        print(f"Ошибка: Неизвестная команда '{command}'. Используйте 'help' для списка команд.")
        sys.exit(1)


if __name__ == '__main__':
    main()

