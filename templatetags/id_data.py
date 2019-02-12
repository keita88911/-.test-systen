from django import template
from django.contrib.auth.models import Group


register = template.Library()

@register.filter(name='has_group')
@register.simple_tag(takes_context=True)
def has_group(user, group_name):
    group =  Group.objects.get(name=group_name)
    return group in user.groups.all()