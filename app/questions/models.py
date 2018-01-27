from django.db import models
from django.utils import timezone
from django_fsm import FSMField, transition
from model_utils.models import TimeStampedModel

from app.users.models import User
from app.groups.models import Group


class Tag(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Question(TimeStampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField()

    status = FSMField(default='UNSOLVED', protected=True)  # UNSOLVED, SOLVED
    is_anonymous = models.BooleanField(default=False)

    original_poster = models.ForeignKey(to=User, on_delete=models.SET_NULL, null=True, related_name='asked_questions')
    solver = models.ForeignKey(to=User, on_delete=models.SET_NULL, null=True, related_name='solved_questions')
    group = models.ForeignKey(to=Group, on_delete=models.SET_NULL, null=True)

    tags = models.ManyToManyField(to=Tag, related_name='questions')

    def can_mark_as_solved(self):
        return self.session.is_closed

    @transition(field=status, source='UNSOLVED', target='SOLVED')
    def mark_as_solved(self):
        pass

    def add_or_create_tags(self, tags):
        for tag_data in tags:
            tag, _ = Tag.objects.get_or_create(**tag_data)
            self.tags.add(tag)

    def __str__(self):
        return f'"{self.title}"'


class Session(TimeStampedModel):
    time_start = models.DateTimeField(default=timezone.now)
    time_end = models.DateTimeField(null=True)
    status = FSMField(default='OPEN', protected=True)  # OPEN, STALE, PENDING CLOSED, CLOSED
    question = models.OneToOneField(to=Question, on_delete=models.CASCADE)
    participants = models.ManyToManyField(to=User, related_name='sessions')

    @property
    def is_closed(self):
        return self.status == 'CLOSED'

    # TODO: Check timestamp of last non-bot message.
    def can_mark_as_stale(self):
        return True

    @transition(field=status, source='OPEN', target='STALE', conditions=[can_mark_as_stale])
    def mark_as_stale(self):
        pass

    @transition(field=status, source='STALE', target='PENDING CLOSED')
    def mark_as_pending_closed(self):
        pass

    # TODO: Check timestamp of last non-bot message and PENDING CLOSED
    @transition(field=status, source='*', target='CLOSED')
    def mark_as_closed(self):
        self.time_end = timezone.now()

    def __str__(self):
        return f'Session for "{self.question.title}"'
